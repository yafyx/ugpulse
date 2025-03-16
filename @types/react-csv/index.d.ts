import * as React from 'react';

declare module 'react-csv' {
    export interface CSVLinkProps {
        data: any[] | string;
        headers?: any[];
        filename?: string;
        separator?: string;
        target?: string;
        enclosingCharacter?: string;
        className?: string;
        style?: React.CSSProperties;
        onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
        asyncOnClick?: boolean;
        uFEFF?: boolean;
    }

    export class CSVLink extends React.Component<CSVLinkProps & React.HTMLProps<HTMLAnchorElement>> { }

    export interface CSVDownloadProps {
        data: any[] | string;
        headers?: any[];
        filename?: string;
        separator?: string;
        target?: string;
        enclosingCharacter?: string;
        uFEFF?: boolean;
    }

    export class CSVDownload extends React.Component<CSVDownloadProps> { }
} 