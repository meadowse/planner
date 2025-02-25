import classNames from 'classnames';

export default function TasksPage({ additClass }) {
    return (
        <div className={classNames('page', additClass)}>
            <p>Задачи</p>
        </div>
    );
}
