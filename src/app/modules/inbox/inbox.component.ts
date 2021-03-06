import {
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';
import {
    Router,
    NavigationStart
} from '@angular/router';
import {
    ImapMailsService
} from '../../service/imapemails.service';
import {
    MdDialog,
    MdDialogConfig,
    MdDialogRef
} from '@angular/material';
import {
    EmailModalComponent
} from '../email-modal/email-modal.component';
import {
    MdSnackBar
} from '@angular/material';
import {
    NgForm,
    FormControl,
    Validators
} from '@angular/forms';
import { Location } from '@angular/common';
import { CoreComponent } from './../../modules/core/core.component';

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit, OnDestroy {
    dialogRef: MdDialogRef < any > ;
    Math: any;
    emaillist: any;
    loading = false;
    tag_id: string;
    tags: any;
    data: any;
    selected: any;
    emailIds: string[];
    selectedTag: any;
    message: string;
    showmessage: boolean;
    showInboxEmailList = true;
    subscription: any;
    tagsForEmailListAndModel: any;
    constructor(public _core: CoreComponent, public _location: Location, public _router: Router, public dialog: MdDialog, public getemails: ImapMailsService, public snackBar: MdSnackBar) {
        this.Math = Math;
        this.getemails.componentMehtodCalled$.subscribe(
        () => {
            this.fetchNewEmails();
        });
    }

    ngOnInit() {
        this.emailIds = [];
        this.loading = true;
        // this.getAllTag();
        this.data = {
            'page': 1,
            'tag_id': 0,
            'limit': 20
        };
        this.defaultOpen();
        setTimeout(() => {
            if (this._location.path().substr(0, 17) === '/core/inbox/email') {
                this.showInboxEmailList = false;
            } else {
                this.showInboxEmailList = true;
            }
        });
        this.subscription = this._core.routerInboxPage.subscribe(() => {
            this.showInboxEmailList = true;
            this.refresh();
        });
    }

    defaultOpen() {
        this.getemails.getAllTagsMain()
            .subscribe((res) => {
                this.formatTagsInArray(res.data);
                if (res.data.length > 0) {
                    if (res.data[0]['data'] && res.data[0]['data'].length > 0) {
                        if (res.data[0]['data'] && res.data[0]['data'].length > 0) {
                            this.data.tag_id = res.data[0]['data'][0]['subchild'][0]['id'] || 1;
                            this.selectedTag = res.data[0]['data'][0]['subchild'][0]['id'] || 1;
                            this.getemails.getEmailList(this.data).subscribe((data) => {
                                this.emaillist = data;
                                this.loading = false;
                            });
                        }
                    }
                }
                // if (this.tags && !!this.tags['Automatic']) {
                //     this.data.tag_id = this.tags['Automatic'][0].id || 1;
                //     this.selectedTag = this.tags['Automatic'][0].id || 1;
                //     this.getemails.getEmailList(this.data).subscribe((data) => {
                //         this.emaillist = data;
                //         this.loading = false;
                //     });
                // }
            }, (err) => {
                this.loading = false;
            });
    }

    searchEmail(searchform: NgForm) {
        if (searchform.valid) {
            if (!!searchform.value['currentTag']) {
                this.data = {
                    'page': 1,
                    'tag_id': this.selectedTag,
                    'limit': 20,
                    'type': searchform.value['option'],
                    'keyword': searchform.value['keyword'],
                    'selected': searchform.value['currentTag']
                };
            } else {
                this.data = {
                    'page': 1,
                    'limit': 20,
                    'type': searchform.value['option'],
                    'keyword': searchform.value['keyword'],
                    'selected': searchform.value['currentTag']
                };
            }
            this.loading = true;
            this.showmessage = false;
            this.getemails.getEmailList(this.data).subscribe((data) => {
                if (data.data.length > 0) {
                    this.emaillist = data;
                    this.emailIds = [];
                    this.loading = false;
                } else {
                    this.message = data.message;
                    this.showmessage = true;
                    this.emaillist = [];
                    this.loading = false;
                }
            });
        }
    }

    addEmail(id: string) {
        this.emailIds.push(id);
    }

    removeEmails(id: string) {
        this.emailIds.splice(this.emailIds.indexOf(id), 1);
    }

    assign(id: any) {
        this.selected = {
            'tag_id': id,
            'mongo_id': this.emailIds,
            'selectedTag': this.selectedTag
        };
        this.getemails.assignTag(this.selected).subscribe((data) => {
            this.refresh();
            this.emailIds.length = 0;
            this.notify('done', '');
        }, (err) => {
            console.log(err);
        });
    }

    delete() {
        this.selected = {
            'tag_id': this.selectedTag,
            'mongo_id': this.emailIds
        };
        this.getemails.deleteEmail(this.selected).subscribe((data) => {
            this.refresh();
            this.emailIds.length = 0;
            this.notify('done', '');
        }, (err) => {
            console.log(err);
        });
    }

    notify(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 2000,
        });
    }

    openEmails(email: any) {
        this.showInboxEmailList = false;
        this._router.navigate(['core/inbox/email', email._id]);
        localStorage.setItem('email', JSON.stringify(email));
        localStorage.setItem('selectedTag', JSON.stringify(this.selectedTag));
        localStorage.setItem('tags', JSON.stringify(this.tagsForEmailListAndModel));
    }

    getAllTag() {
        this.getemails.getAllTagsMain()
            .subscribe((res) => {
                this.formatTagsInArray(res.data);
            }, (err) => {
                this.loading = false;
            });
    }

    emaillists(id: any, page?: number) {
        if (this._location.path().substr(0, 17) === '/core/inbox/email') {
            this.showInboxEmailList = true;
            this._location.back();
        }
        this.selectedTag = id;
        this.data = null;
        this.showmessage = false;
        this.data = {
            'page': page || 1,
            'tag_id': id || 0,
            'limit': 20
        };
        this.loading = true;
        this.getemails.getEmailList(this.data).subscribe((data) => {
            this.emaillist = data;
            this.emailIds = [];
            this.loading = false;
        });
    }

    searchEmailList(page: number) {
        this.data.page = page || 1;
        this.showmessage = false;
        this.loading = true;
        this.getemails.getEmailList(this.data).subscribe((data) => {
            this.emaillist = data;
            this.emailIds = [];
            this.loading = false;
        });
    }

    previous() {
        if (this.data.page > 1) {
            this.data.page = this.data.page - 1;
            if (!this.data.type) {
                this.emaillists(this.data.tag_id, this.data.page);
            } else {
                this.searchEmailList(this.data.page);
            }
        }
    }

    next() {
        if (this.data.page < this.emaillist.count / this.data.limit) {
            this.data.page = this.data.page + 1;
            if (!this.data.type) {
                this.emaillists(this.data.tag_id, this.data.page);
            } else {
                this.searchEmailList(this.data.page);
            }
        }
    }

    fetchNewEmails() {
        this.loading = true;
        this.getemails.refreshNewEmails().subscribe((data) => {
            this.refresh();
        });
    }

    refresh(id?: string) {
        this.getAllTag();
        this.getemails.getEmailList(this.data).subscribe((data) => {
            this.emailIds = [];
            this.emaillist = data;
        });
    }

    formatTagsInArray(data: any) {
        this.tags = data;
        this.tagsForEmailListAndModel = {};
        for (let i = 0; i < data.length; i++) {
            if (!this.tagsForEmailListAndModel['Default']) {
                this.tagsForEmailListAndModel['Default'] = [];
                this.tagsForEmailListAndModel['Default'] = data[0]['data'][0]['subchild'];
            } else {
                this.tagsForEmailListAndModel['Default'] = data[0]['data'][0]['subchild'];
            }
            if (data[i]['data'] && data[i]['data'].length > 0) {
                for (let j = 0; j < data[i]['data'].length; j++) {
                    if (data[i]['data'][j]['type'] === 'Automatic') {
                        if (!this.tagsForEmailListAndModel['Automatic']) {
                            this.tagsForEmailListAndModel['Automatic'] = [];
                            this.tagsForEmailListAndModel['Automatic'].push(data[i]['data'][j]);
                        } else {
                            this.tagsForEmailListAndModel['Automatic'].push(data[i]['data'][j]);
                        }
                    }
                }
            }
        }
        this.loading = false;
    }

    trackByEmails(index, email) {
        return email ? email._id : undefined;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
