// Импорт стилей
import './addtask_toast.css';

export default function AddTaskToast({ task }) {
    console.log(`AddTaskToast task: ${JSON.stringify(task, null, 4)}`);
    return (
        <div className="toast">
            <div className="toast-content">
                <div className="toast-header">
                    <h1 className="toast-header__title toast-title">
                        <span>{task?.title}</span>
                    </h1>
                    <p className="toast-header__user">
                        от <span>{task?.director?.fullName || 'Нет данных'}</span>
                    </p>
                </div>
                <div className="toast-date">
                    <h2 className="toast-title">Срок</h2>
                    <p>{task?.deadline || '--.--.--'}</p>
                </div>
                <div className="toast-text">
                    <h3 className="toast-title">Комментарий</h3>
                    <p>{task?.comment || ''}</p>
                </div>
            </div>
        </div>
    );
}
