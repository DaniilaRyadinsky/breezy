import { TextSegmentType, StyleText } from "@/entities/note/model/blockTypes";

const TextSegment = ({style, text}: TextSegmentType) => {
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
        <span style={getStyle()}>{text? text:''}</span>
    )
}

export default TextSegment