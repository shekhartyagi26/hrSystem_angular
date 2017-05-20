import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { ImapMailsService } from '../../service/imapemails.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-add-email-temp',
    templateUrl: './add-email-temp.component.html',
    styleUrls: ['./add-email-temp.component.scss'],
})
export class AddEmailTempComponent implements OnInit {
    userVar: any;
    sysVar: any;
    ckeditorContent: any;
    constructor(public dialogRef: MdDialogRef<any>, private getVariable: ImapMailsService) {
    }

    ngOnInit() {
    }

    save(form: NgForm) {
        form.reset();
        this.dialogRef.close();
    }

    close() {
        this.dialogRef.close();
    }
}
