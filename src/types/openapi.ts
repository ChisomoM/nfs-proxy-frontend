export interface OpenApiSpec {
    swagger: string;
    info: {
        title: string;
        description: string;
        version: string;
    };
    host?: string;
    basePath?: string;
    schemes?: string[];
    paths: Record<string, PathItem>;
    definitions?: Record<string, Schema>;
    securityDefinitions?: Record<string, SecurityDefinition>;
    tags?: Tag[];
}

export interface Tag {
    name: string;
    description?: string;
}

export interface PathItem {
    get?: Operation;
    post?: Operation;
    put?: Operation;
    delete?: Operation;
    patch?: Operation;
    parameters?: Parameter[];
}

export interface Operation {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    consumes?: string[];
    produces?: string[];
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses: Record<string, Response>;
    security?: Record<string, string[]>[];
    deprecated?: boolean;
}

export interface Parameter {
    name: string;
    in: "query" | "header" | "path" | "formData" | "body";
    description?: string;
    required?: boolean;
    type?: string;
    schema?: Schema;
    items?: Schema; // For array types
    enum?: string[];
    default?: any;
    format?: string;
}

export interface Response {
    description: string;
    schema?: Schema;
}

export interface RequestBody {
    description?: string;
    required?: boolean;
    content: Record<string, MediaType>;
}

export interface MediaType {
    schema?: Schema;
    example?: any;
}

export interface Schema {
    $ref?: string;
    type?: string;
    properties?: Record<string, Schema>;
    items?: Schema;
    required?: string[];
    description?: string;
    example?: any;
    enum?: string[];
}

export interface SecurityDefinition {
    type: string;
    name?: string;
    in?: string;
}

export interface DocOverride {
    path: string;
    method: string;
    description?: string; // Markdown content
    summary?: string;
}
