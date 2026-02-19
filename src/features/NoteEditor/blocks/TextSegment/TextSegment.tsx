import { ITextSegment, StyleText } from "../../../../entities/note/model/blockTypes";

const TextSegment = ({style, text}: ITextSegment) => {
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
        <span style={getStyle()}>{text}</span>
    )
}

export default TextSegment