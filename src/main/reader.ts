/**
 * @author Roman Vottner
 * @copyright 2020 Roman Vottner
 * @license Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Parser } from "./parser";
import { Validator, ValidatorImpl, Dictionary, SegmentEntry, ElementEntry } from "./validator";

import { segments as segmentTable } from "./segments";
import { elements as elementTable} from "./elements";

export type ResultType = {
    name: string;
    elements: string[][];
};

/**
 * The `Reader` class is included for backwards compatibility. It translates an
 * UN/EDIFACT document to an array of segments. Each segment has a `name` and
 * `elements` property where `elements` is an array consisting of component
 * arrays. The class exposes a `parse()` method which accepts the document as a
 * string.
 */
export class Reader {

    private result: ResultType[];
    private elements: string[][];
    private components: string[];

    private validator: Validator;
    private parser: Parser;

    constructor() {
        this.validator = new ValidatorImpl();
        this.validator.define(segmentTable);
        this.validator.define(elementTable);
        this.parser = new Parser(this.validator);

        this.result = [];
        const result: ResultType[] = this.result;

        this.elements = [];
        let elements: string[][] = this.elements;

        this.components = [];
        let components: string[] = this.components;

        this.parser.onOpenSegment = function (segment: string): void {
            elements = [];
            result.push({ name: segment, elements:  elements });
        };
        this.parser.onElement = function (): void {
            components = [];
            elements.push(components);
        };
        this.parser.onComponent = function (value: string): void {
            components.push(value);
        };
    }

    /**
     * Provide the underlying `Validator` with segment or element definitions.
     *
     * @summary Define segment and element structures.
     * @param definitions An object containing the definitions.
     */
    define(definitions: (Dictionary<SegmentEntry> | Dictionary<ElementEntry>)): void {
        this.validator.define(definitions);
    }

    encoding(level: string): void {
        this.parser.encoding(level);
    }

    parse(document: string): ResultType[] {
        this.parser.write(document);
        // this.parser.end();
        return this.result;
    }
}