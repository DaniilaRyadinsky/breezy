export enum StyleText {
    Bold,
    Normal,
    Italic //стили не все
}

export interface IBaseText {
    id: string,
    style: StyleText,
    text: string
}



const BaseText = ({id, style, text}: IBaseText) => {
    const getStyle = () => {
        switch (style) {
            case StyleText.Bold:
                return { fontWeight: 'bold' };
            case StyleText.Italic:
                return { fontStyle: 'italic' };
            case StyleText.Normal:
            default:
                return {};
        }
    };

    return (
        <span id={id} style={getStyle()}>{text}</span>
    )
}

export default BaseText