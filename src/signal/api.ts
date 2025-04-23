import * as hono_hono_base from "hono/hono-base";
import * as hono_types from "hono/types";
import * as hono_utils_http_status from "hono/utils/http-status";

declare const app: hono_hono_base.HonoBase<
  {},
  | hono_types.BlankSchema
  | hono_types.MergeSchemaPath<
      {
        "/": {
          $post: {
            input: {
              json: {
                otp?: string | null | undefined;
              };
            };
            output:
              | {
                  type: "error";
                  error: string;
                }
              | {
                  type: "success";
                  data: {
                    token: string;
                  };
                };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
          };
        };
      } & {
        "/": {
          $get: {
            input: {};
            output:
              | {
                  type: "error";
                  error: string;
                }
              | {
                  type: "success";
                  data: {
                    uid: string;
                  };
                };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
          };
        };
      } & {
        "/otp": {
          $post: {
            input: {};
            output:
              | {
                  type: "error";
                  error: string;
                }
              | {
                  type: "success";
                  data: {
                    otp: string;
                    expiresAt: number;
                  };
                };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
          };
        };
      },
      "/auth"
    >
  | hono_types.MergeSchemaPath<
      {
        "/connections": {
          $get: {
            input: {};
            output: {};
            outputFormat: string;
            status: hono_utils_http_status.StatusCode;
          };
        };
      } & {
        "/connections": {
          $post: {
            input: {
              json: {
                sdp: string;
              };
            };
            output:
              | {
                  type: "error";
                  error: string;
                }
              | {
                  type: "success";
                  data: {
                    sdp: string;
                  };
                };
            outputFormat: "json";
            status: hono_utils_http_status.ContentfulStatusCode;
          };
        };
      } & {
        "/connections/:id/accept": {
          $post:
            | {
                input: {
                  json: {
                    sdp: string;
                  };
                } & {
                  param: {
                    id: string;
                  };
                };
                output: {
                  error: string;
                };
                outputFormat: "json";
                status: 404;
              }
            | {
                input: {
                  json: {
                    sdp: string;
                  };
                } & {
                  param: {
                    id: string;
                  };
                };
                output:
                  | {
                      type: "error";
                      error: string;
                    }
                  | {
                      type: "success";
                    };
                outputFormat: "json";
                status: hono_utils_http_status.ContentfulStatusCode;
              };
        };
      },
      "/sessions"
    >,
  "/"
>;
type App = typeof app;

export type { App };
