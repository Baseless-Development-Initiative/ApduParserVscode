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
import { APDU, ParseAPDUHeader, ApduListUpdate } from "./apdu_defs";

const APDU_HEADER_SIZE:number = 4

function getZeroPaddedHexByteFromInt(num:number): string
{
    return num.toString(16).toUpperCase().padStart(2, "0");
}

function ApduParseHeader(header:number[]): string
{
    let header_string:string = "";
    if (header.length < APDU_HEADER_SIZE) {
        vscode.window.showErrorMessage("Invalid APDU Header");
        return header_string;
    }
    let apdu:APDU = ParseAPDUHeader(header[0], header[1], header[2], header[3]);
    header_string += "CLA: " + getZeroPaddedHexByteFromInt(apdu.cla.val) + " (" + apdu.cla.name + ") " + "\n";
    header_string += "INS: " + getZeroPaddedHexByteFromInt(apdu.ins.val) + " (" + apdu.ins.name + ") " + "\n";
    header_string += "P1:  " + getZeroPaddedHexByteFromInt(apdu.p1.val) + " (" + apdu.p1.name + ") " + "\n";
    header_string += "P2:  " + getZeroPaddedHexByteFromInt(apdu.p2.val) + " (" + apdu.p2.name + ") " + "\n";
    return header_string;
}

function ApduParsePayload(payload:number[], apdu_length:number): string
{
    let payload_string:string = "";
    if (payload.length < apdu_length) {
        vscode.window.showErrorMessage("Invalid APDU payload");
        return payload_string;
    }
    if (apdu_length === 0) {
        return payload_string;
    }
    let parsed_length:number = 0;
    let parsed_tlvs:number = 0;
    while(parsed_length < apdu_length) {
        parsed_tlvs++;
        let tag:number = payload[parsed_length++];
        let length:number = payload[parsed_length++];
        if (length & 0x80) {
            let length_of_len:number = length & 0x7F;
            length = 0;
            while(length_of_len) {
                length = (length << 8) + payload[parsed_length++];
                length_of_len--;
            }
        }
        let value:string = "";
        let value_array = payload.slice(parsed_length, parsed_length + length);
        for (let entry of value_array) {
            value = value + entry.toString(16).toUpperCase().padStart(2, "0");
        }
        parsed_length += length;
        payload_string += "TLV " + parsed_tlvs.toString(10) + ":" + "\n";
        payload_string += "\tTAG: " + tag.toString(16).toUpperCase().padStart(2, "0") + "\n";
        payload_string += "\tLEN: " + length.toString(16).toUpperCase().padStart(2, "0") + "\n";
        payload_string += "\tVAL: " + value.toUpperCase() + "\n";
    }

    return payload_string;
}

export async function ApduParser(input: string)
{
    ApduListUpdate();
    let output_values:number[] = [];
    let input_len:number = input.length;
    let iterator:number = 0;
    while(iterator < input_len) {
        let substring:string = input.substring(iterator, iterator + 2);
        if (substring.length != 2) {
            vscode.window.showErrorMessage("Invalid length input");
            return;
        }
        output_values.push(parseInt(substring, 16));
        iterator += 2;
    }

    let formatted_string = ApduParseHeader(output_values);
    output_values = output_values.slice(APDU_HEADER_SIZE);
    /** Parse length of APDU */
    let apdu_length = output_values[0];
    iterator = 1;
    if (apdu_length & 0x80) {
        /** Extended length */
        let length_of_len = apdu_length & 0x7F;
        apdu_length = 0;
        iterator = 1;
        while(length_of_len) {
            apdu_length = (apdu_length << 8) + output_values[iterator];
            iterator++;
            length_of_len--;
        }
    }
    output_values = output_values.slice(iterator);
    formatted_string += "LEN: " + apdu_length.toString(16).toUpperCase().padStart(2, "0") + "\n";
    /** Handle TLVs */
    formatted_string += "\n";
    formatted_string += ApduParsePayload(output_values, apdu_length);
    output_values = output_values.slice(apdu_length);
    if (output_values.length > 0) {
        formatted_string += "LE:  ";
        for (let entry of output_values) {
            formatted_string += entry.toString(16).toUpperCase().padStart(2, "0");
        }
    }
    let parsed_document = vscode.workspace.openTextDocument({content:formatted_string});
    // final_document:vscode.TextDocument = await parsed_document;
    vscode.window.showTextDocument(await parsed_document);
}
