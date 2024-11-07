export function formatIcons(iconList) {
    return iconList.map(iconName => ({
        name: iconName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
        value: iconName,
        class: 'material-icons'
    }));
}