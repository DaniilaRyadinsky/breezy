import { Link } from 'react-router-dom';
import { IBaseBlock, BlockTypes, Block } from '../../model/types'
import { Paragraph } from '../Paragraph/Paragraph';
import List from '../List/List';
import styles from './BaseBlock.module.css'
import Header from '../Header/Header';

const BaseBlock = (props: Block) => {
    function GiveBlock() {
    switch (props.type) {
        case BlockTypes.Paragraph:
            return <Paragraph {...props}/>;
        case BlockTypes.List:
            return <List {...props}/>;
        case BlockTypes.Header:
            return <Header {...props}/>;
        case BlockTypes.Quote:
            return;
    }}

    return (
        <div contentEditable className={styles.container}>
            {GiveBlock()}
        </div>
    );
}

export default BaseBlock