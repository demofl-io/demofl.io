// js/editor/utils/icons.ts
export interface IconFormatted {
    name: string;
    value: string;
    class: string;
}

export function formatIcons(iconList: string[]): IconFormatted[] {
    return iconList.map(iconName => ({
        name: iconName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
        value: iconName,
        class: 'material-icons'
    }));
}