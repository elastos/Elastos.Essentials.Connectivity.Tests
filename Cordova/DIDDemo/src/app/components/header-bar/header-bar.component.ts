import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare let appManager: any;

@Component({
    selector: 'header-bar',
    templateUrl: './header-bar.component.html',
    styleUrls: ['./header-bar.component.scss'],
})
export class HeaderBarComponent implements OnInit {
    public back_touched = false;

    @Input('title') title: string = "";
    @Input('showMinimize') showMinimize: boolean = true;
    @Input('showClose') showClose: boolean = true;
    @Input('showMenu') showMenu: boolean = false;
    @Output('onMenu') onMenu = new EventEmitter();

    constructor() { }

    ngOnInit() { }

    minimize() {
        appManager.launcher();
    }

    close() {
        appManager.close()
    }

    menu(event) {
        this.onMenu.emit(event);
    }
}
