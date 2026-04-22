export type InputType = "thought" | "prompt" | "decree" | "ping";
export type InputLang = "en" | "de";
export type InputSource = "seed" | "audience";
export type InputContext = InputType;

export interface InputRecord {
	id: number;
	text: string;
	type: InputType;
	lang: InputLang;
	source: InputSource;
	valid: boolean;
	created_at: string;
	modified_at: string;
	attribute_class?: string | null;
	trait?: string | null;
	trait_offset?: number;
	trait_entailment?: number;
	score_health?: number;
	score_split?: number;
	score_impact?: number;
}

// UI / frontend helper types
export type UILang = InputLang;

export interface Prompt {
	id: string;
	text: string;
	lang: InputLang;
	source: InputSource;
}

// Thought commands
export interface AddThoughtCommand {
	action: "add";
	type: "thought";
	text: string;
	lang: InputLang;
	source: InputSource;
	prompt_id: number;
}

export interface QueryThoughtCommand {
	action: "query";
	type: "thought";
	query_type: "all" | "recent" | "by_id";
	filters?: Record<string, any>;
}

export interface DeleteThoughtCommand {
	action: "delete";
	type: "thought";
	record_id: number;
}

export interface UpdateThoughtCommand {
	action: "update";
	type: "thought";
	record_id: number;
	text: string;
}

// Prompt commands
export interface AddPromptCommand {
	action: "add";
	type: "prompt";
	text: string;
	lang: InputLang;
	source: InputSource;
}

export interface QueryPromptCommand {
	action: "query";
	type: "prompt";
	query_type: "all" | "recent" | "by_id";
	filters?: Record<string, any>;
}

export interface DeletePromptCommand {
	action: "delete";
	type: "prompt";
	record_id: number;
}

export interface UpdatePromptCommand {
	action: "update";
	type: "prompt";
	record_id: number;
	text: string;
}

// Decree commands
export interface AddDecreeCommand {
	action: "add";
	type: "decree";
	text: string;
	lang: InputLang;
	source: InputSource;
}

export interface SendKeystrokeCommand {
	action: "send";
	type: "keystroke";
	key: string;
	context: InputContext;
}

export interface QueryDecreeCommand {
	action: "query";
	type: "decree";
	query_type: "all" | "recent" | "by_id";
	filters?: Record<string, any>;
}

export interface DeleteDecreeCommand {
	action: "delete";
	type: "decree";
	record_id: number;
}

export interface UpdateDecreeCommand {
	action: "update";
	type: "decree";
	record_id: number;
	text: string;
}

export type WebSocketCommand =
	| AddThoughtCommand
	| QueryThoughtCommand
	| DeleteThoughtCommand
	| UpdateThoughtCommand
	| AddPromptCommand
	| QueryPromptCommand
	| DeletePromptCommand
	| UpdatePromptCommand
	| AddDecreeCommand
	| QueryDecreeCommand
	| DeleteDecreeCommand
	| UpdateDecreeCommand
	| SendKeystrokeCommand;

export interface WebSocketResponse {
	status: "success" | "error";
	action?: string;
	type?: InputType;
	error?: string;
	record?: InputRecord;
	records?: InputRecord[];
	count?: number;
	query_type?: string;
	forwarded?: boolean;
	record_id?: number;
	deleted?: boolean;
	[key: string]: any;
}

export type WebSocketMatcher = (resp: WebSocketResponse) => boolean;
