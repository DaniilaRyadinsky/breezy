import { Tag } from "../../tag/model/types";
import { Block } from "./blockTypes";

export type NoteInfo = {
    id: string,
    title: string,
    first_block: string,
    updated_at: string,
    role: string,
    tag: Tag,
}


export type Note = {
    id: null | string;
    author: string,
    editors: string[],
    readers: string[],
    title: string;
    created_at: number,
    updated_at: number,
    blocks: Block[],
    tag: Tag
}
