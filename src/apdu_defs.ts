/** 
 * Copyright 2025 Chinmaya Acharya
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import { readFileSync } from "fs";
import fs from 'fs';

interface CLA {
    val:number;
    name:string;
}

interface P1 {
    val:number;
    name:string;
}

interface P2 {
    val:number;
    name:string;
}

interface TLV {
    tag:number;
    name:string;
}

interface INS {
    val:number;
    name:string;
    p1:P1[];
    p2:P2[];
    tlvs:TLV[];
}

interface APDUDef {
    cla:CLA;
    ins:INS[];
}

export interface APDU {
    cla:CLA;
    ins:INS;
    p1:P1;
    p2:P2;
}

// interface AnotherAPDUINS {
//     name:string;
//     apdu_id:number;
//     tlvs:TLV[];
// }

const PATH_TO_CONFIG_FILE:string = "/.vscode/apdu_config.json";

/** CLA Interindustry */
const CLA_Interindustry:number = 0x00;
const CLA_Interindustry_str:string = "Interindustry";
/** CLA Proprietary */
const CLA_Proprietary:number = 0x80;
const CLA_Proprietary_str:string = "Proprietary";
/** P1 Default */
const P1_Default:number = 0;
const P1_Default_str:string = "P1_Default";
/** P2 Default */
const P2_Default:number = 0;
const P2_Default_str:string = "P2_Default";

let interindustry_commands:APDUDef = {
    cla:{name:CLA_Interindustry_str,val:CLA_Interindustry},
    ins:[] /** Add known instructions here */
};
let proprietary_commands:APDUDef = {
    cla:{name:CLA_Proprietary_str,val:CLA_Proprietary},
    ins:[] /** Add known instructions here */
};

function resyncApduConfig(path:string):string {
    const file = readFileSync(path, "utf-8");
    return file
}

// function ApduUpdaterP1P2(object:any):P1[]|P2[]|undefined {
//     let p1p2:P1[]|P2[] = [];

//     for (let entry of object) {
//         let name:string = "";
//         let val:number;
//         Object.entries(entry).forEach(([key, value]) => {
//             if ("Name" === key) {
//                 name = <string> value;
//             }
//             else if ("val" === key) {
//                 val = parseInt(<string> value, 16);
//                 let param:P1 = {name:name, val:val};
//                 p1p2.push(param);
//             }
//         })
//     }
//     if (p1p2.length === 0) {
//         return undefined;
//     }

//     return p1p2;
// }

// function ApduUpdaterINS(object:any):INS[] {
//     let ins_array:INS[] = [];
//     // let ins_array = new Map<number, string>();
//     Object.entries(object).forEach(([ins, value]) => {
//         let ins_obj:INS = {
//             name: "",
//             p1:[{name:P1_Default_str,val:P1_Default}],
//             p2:[{name:P2_Default_str,val:P2_Default}],
//             val:0
//         };
//         let value_json:JSON = <JSON> value;
//         Object.entries(value_json).forEach(([key2, value2]) => {
//             if ("Name" === key2) {
//                 ins_obj.val = parseInt(ins, 16);
//                 ins_obj.name = value2;
//             }
//             else if ("P1" === key2) {
//                 let p1 = ApduUpdaterP1P2(value2);
//                 if (p1) {
//                     ins_obj.p1 = p1;
//                 }
//             }
//             else if ("P2" === key2) {
//                 let p2 = ApduUpdaterP1P2(value2);
//                 if (p2) {
//                     ins_obj.p2 = p2;
//                 }
//             }
//             else {
//                 /** Add other parameter handling here, eg for P1/P2 */
//                 vscode.window.showWarningMessage("Unknown parameter ", key2);
//             }
//         })
//         ins_array.push(ins_obj);
//     })
//     return ins_array;
// }

// function ApduUpdaterCLA(object:any)
// {
//     Object.entries(object).forEach(([cla, value]) => {
//         let cla_value:number = parseInt(cla, 16);
//         let value_json:JSON = <JSON> value;
//         Object.entries(value_json).forEach(([key, value2]) => {
//             if (key === "Name") {
//                 /** Found the CLA string - add entry */
//                 if (0x00 === cla_value) {
//                     /** Interindustry APDU */
//                     interindustry_commands.cla.val = cla_value;
//                     interindustry_commands.cla.name = value2;
//                 }
//                 else {
//                     /** Proprietary APDU */
//                     proprietary_commands.cla.val = cla_value;
//                     proprietary_commands.cla.name = value2;
//                 }
//             }
//             else if (key === "INS") {
//                 if (0x00 === cla_value) {
//                     /** Add INS values to interindustry commands */
//                     let ins:INS[] = ApduUpdaterINS(value2);
//                     for (let entry of ins) {
//                         interindustry_commands.ins.push(entry);
//                     }
//                 }
//                 else {
//                     /** Add INS values to proprietary commands */
//                     let ins:INS[] = ApduUpdaterINS(value2);
//                     for (let entry of ins) {
//                         proprietary_commands.ins.push(entry);
//                     }
//                 }
//             }
//             else {
//                 vscode.window.showErrorMessage("Unknown key in JSON file");
//                 return;
//             }
//         })
//     })
// }

function isP1InINS(ins:INS, p1:P1):boolean {
    for (let p1entry of ins.p1) {
        if (p1entry.val === p1.val) {
            return true;
        }
    }
    return false;
}

function isP2InINS(ins:INS, p2:P2):boolean {
    for (let p2entry of ins.p2) {
        if (p2entry.val === p2.val) {
            return true;
        }
    }
    return false;
}

function isTLVInEntry(ins:INS, tlv:TLV):boolean {
    for (let tlventry of ins.tlvs) {
        if (tlventry.tag === tlv.tag) {
            return true;
        }
    }
    return false;
}

function ParseApduP1(object:any):P1[] {
    let p1_array:P1[] = [];
    for (let entry of object) {
        let name:string|undefined = undefined;
        let val:number|undefined = undefined;
        Object.entries(entry).forEach(([key, value]) => {
            if ("name" === key) {
                name = <string> value;
            }
            else if ("val" === key) {
                val = parseInt(<string> value, 16);
            }
        })
        if (!(undefined === name || undefined === val)) {
            let p1:P1 = {name:name, val:val};
            p1_array.push(p1);
        }
        else {
            vscode.window.showWarningMessage("Corrupted JSON file: parsing P1");
        }
    }
    return p1_array;
}

function ParseApduP2(object:any):P2[] {
    let p2_array:P2[] = [];
    for (let entry of object) {
        let name:string|undefined = undefined;
        let val:number|undefined = undefined;
        Object.entries(entry).forEach(([key, value]) => {
            if ("name" === key) {
                name = <string> value;
            }
            else if ("val" === key) {
                val = parseInt(<string> value, 16);
            }
        })
        if (!(undefined === name || undefined === val)) {
            let p2:P2 = {name:name, val:val};
            p2_array.push(p2);
        }
        else {
            vscode.window.showWarningMessage("Corrupted JSON file: parsing P2");
        }
    }
    return p2_array;
}

function ParseApduTLVs(object:any):TLV[] {
    let tlv_array:TLV[] = [];
    for (let entry of object) {
        let name:string|undefined = undefined;
        let val:number|undefined = undefined;
        Object.entries(entry).forEach(([key, value]) => {
            if ("name" === key) {
                name = <string> value;
            }
            else if ("val" === key) {
                val = parseInt(<string> value, 16);
            }
        })
        if (!(undefined === name || undefined === val)) {
            let tlv:TLV = {name:name, tag:val};
            tlv_array.push(tlv);
        }
        else {
            vscode.window.showWarningMessage("Corrupted JSON file: parsing P2");
        }
    }
    return tlv_array;
}

function AddEntryIntoAPDUClass(commands:APDUDef, name:string, ins_value:number, p1:P1[], p2:P2[], tlvs:TLV[])
{
    // Look for entry in proprietary array
    let added:boolean = false;
    for (let entry of commands.ins) {
        if (entry.name === name) {
            // Found INS entry
            added = true;
            for (let p1entry of p1) {
                if (false === isP1InINS(entry, p1entry)) {
                    entry.p1.push(p1entry);
                }
            }
            for (let p2entry of p2) {
                if (false === isP2InINS(entry, p2entry)) {
                    entry.p2.push(p2entry);
                }
            }
            for (let tlventry of tlvs) {
                if (false === isTLVInEntry(entry, tlventry)) {
                    entry.tlvs.push(tlventry);
                }
            }
        }
    }
    if (false === added) {
        // No entry found matching the INS name
        // Create a new entry for INS
        let ins:INS = {name:name, val:ins_value, p1:p1, p2:p2, tlvs:tlvs};
        commands.ins.push(ins);
    }
}

function ParseApduConfig(object:any)
{
    Object.entries(object).forEach(([name, apdu]) => {
        let apdu_json:JSON = <JSON> apdu;
        let cla_value:number|undefined = undefined;
        let ins_value:number|undefined = undefined;
        let p1:P1[] = [{name: P1_Default_str, val: P1_Default}];
        let p2:P2[] = [{name: P2_Default_str, val: P2_Default}];
        let tlvs:TLV[] = [];
        Object.entries(apdu_json).forEach(([key, value]) => {
            if ("CLA" === key) {
                // Found class key
                cla_value = parseInt(value, 16);
            }
            else if ("INS" === key) {
                ins_value = parseInt(value, 16);
            }
            else if ("P1" === key) {
                p1 = ParseApduP1(value);
            }
            else if ("P2" === key) {
                p2 = ParseApduP2(value);
            }
            else if ("TLV" === key) {
                tlvs = ParseApduTLVs(value);
            }
        })
        if (cla_value && ins_value) {
            // Look for existing entry in array
            if (cla_value & CLA_Proprietary) {
                AddEntryIntoAPDUClass(proprietary_commands, name, ins_value, p1, p2, tlvs);
            }
            else {
                AddEntryIntoAPDUClass(interindustry_commands, name, ins_value, p1, p2, tlvs);
            }
        }
        else {
            vscode.window.showWarningMessage("Incorrect entry");
        }
    })
}

export async function ApduListUpdate()
{
    let ws_folders = vscode.workspace.workspaceFolders;
    if (undefined != ws_folders) {
        /** Workspace folder is open */
        vscode.window.showInformationMessage(ws_folders[0].uri.fsPath);
        let path_to_config_file = ws_folders[0].uri.fsPath + PATH_TO_CONFIG_FILE;
        if (true == fs.existsSync(path_to_config_file)) {
            const text = resyncApduConfig(path_to_config_file);
            let parsed_json = JSON.parse(text);
            // let yy = parsed_json['CLA'];

            ParseApduConfig(parsed_json);
            // Object.entries(parsed_json).forEach(([key, value]) => {
            //     if ('CLA' === key) {
            //         ApduUpdaterCLA(value);
            //     }
            // })

            // let doc = vscode.workspace.openTextDocument({content:text});
            // vscode.window.showTextDocument(await doc);
        }
    }
    else {
        vscode.window.showErrorMessage("No workspace opened");
    }
    // vscode.workspace.fs.stat(vscode.Uri.file(".vscode/apdu_config.json"))
    // const text = resyncApduConfig("./apdu_config.json")
    // let another_document = vscode.workspace.openTextDocument({content:text});
    // vscode.window.showTextDocument(await another_document);
}

export function ParseAPDUHeader(cla:number, ins:number, p1:number, p2:number):APDU
{
    let apdu:APDU = {
        cla:{name:"Unknown", val:cla},
        ins:{name:"Unknown", val:ins, p1:[{name:"", val:0x00}], p2:[{name:"", val:0x00}], tlvs:[]},
        p1:{name:"Unknown", val:p1},
        p2:{name:"Unknown", val:p2},
    }
    if (p1 === P1_Default) {
        apdu.p1.name = P1_Default_str;
    }
    if (p2 === P2_Default) {
        apdu.p2.name = P2_Default_str;
    }

    if ((CLA_Proprietary & cla) == CLA_Proprietary) {
        /** Proprietary APDU */
        apdu.cla.name = proprietary_commands.cla.name;
        for (let ins_entry of proprietary_commands.ins) {
            let found_match:boolean = false;
            if (ins_entry.val === ins) {
                for (let p1_entry of ins_entry.p1) {
                    if (p1_entry.val === p1) {
                        for (let p2_entry of ins_entry.p2) {
                            if (p2_entry.val === p2) {
                                // Found match
                                found_match = true;
                                apdu.ins.name = ins_entry.name;
                                apdu.p1.name = p1_entry.name;
                                apdu.p2.name = p2_entry.name;
                                break;
                            }
                        }
                        break;
                    }
                }
                if (found_match) {
                    break;
                }
            }
        }
    }
    else {
        /** Interindustry APDU */
        apdu.cla.name = interindustry_commands.cla.name;
        for (let ins_entry of interindustry_commands.ins) {
            let found_match:boolean = false;
            if (ins_entry.val === ins) {
                for (let p1_entry of ins_entry.p1) {
                    if (p1_entry.val === p1) {
                        for (let p2_entry of ins_entry.p2) {
                            if (p2_entry.val === p2) {
                                // Found match
                                found_match = true;
                                apdu.ins.name = ins_entry.name;
                                apdu.p1.name = p1_entry.name;
                                apdu.p2.name = p2_entry.name;
                                break;
                            }
                        }
                        break;
                    }
                }
                if (found_match) {
                    break;
                }
            }
        }
    }

    return apdu;
}
