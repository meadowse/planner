import classNames from 'classnames';

export default function ChatPage({ additClass }) {
    return (
        <div className={classNames('page', additClass)}>
            <p>Чат</p>
        </div>
    );
}
