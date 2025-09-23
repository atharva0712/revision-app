/// <reference types="vite/client" />

declare module "*.svg" {
  import { FunctionComponent, SVGProps } from "react";
  const content: string;
  export default content;
}

declare module "*.svg?react" {
  import { FunctionComponent, SVGProps } from "react";
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}