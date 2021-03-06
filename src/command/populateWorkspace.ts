'use strict';
import * as vscode from 'vscode';

import {IError} from './../spgo';
import {Logger} from '../util/logger';
import {UiHelper} from './../util/uiHelper';
import {SPFileService} from './../service/spFileService';
import {AuthenticationService} from './../service/authenticationservice';

export default function populateWorkspace() : Thenable<any> {
        
    Logger.outputMessage('Starting File Synchronization...', vscode.window.spgo.outputChannel);
    let fileService : SPFileService = new SPFileService();

    return UiHelper.showStatusBarProgress('Populating workspace',
        AuthenticationService.verifyCredentials(vscode.window.spgo)
            .then(downloadFiles)
            .catch(err => Logger.outputError(err, vscode.window.spgo.outputChannel))
    );

    function downloadFiles() : Thenable<any> {
        
        return new Promise(function (resolve, reject) {
            let downloads : Promise<any>[] = [];

            if(vscode.window.spgo.config.remoteFolders){
                for (let folder of vscode.window.spgo.config.remoteFolders) {
                    downloads.push(fileService.downloadFiles(folder));
                }
                Promise.all(downloads)
                    .then(function(){
                        Logger.outputMessage(`file synchronization complete.`, vscode.window.spgo.outputChannel);
                        resolve();
                    })
            }
            else{
                let error : IError ={
                    message : '"remoteFolders":[string] property not configured in workspace configuration file.'
                };
                Logger.showError(error.message, error);
                reject();
            }
        });
    }
}
