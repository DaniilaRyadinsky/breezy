import { TextSegmentType } from "@/entities/note/model/blockTypes";

const TextSegment = ({ style, string }: TextSegmentType) => {
    const getStyle = () => {
        switch (style) {
            case 'bold':
                return { fontWeight: 'bold' };
            case 'italic':
                return { fontStyle: 'italic' };
            case 'underline':
                return { textDecoration: 'underline' }
            case 'default':
            default:
                return {};
        }
    };



    return (
        <span style={getStyle()}>{string || "\u200B"}</span>
    )
}

export default TextSegment