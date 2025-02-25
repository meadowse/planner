import StructUser from './StructUser';

export default function CardSubordination({ data }) {
    const { managers, subordinates } = data;
    return (
        <div className="card__block subordination">
            <div className="card__row">
                <div className="card__col">
                    <div className="card__text grey fw-600">Руководитель</div>
                    <StructUser status={managers} />
                </div>
                <div className="card__col">
                    <div className="card__text grey fw-600">Подчиненные</div>
                    <StructUser status={subordinates} />
                </div>
            </div>
        </div>
    );
}
