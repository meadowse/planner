export default function CardGroup({ group }) {
    if (group && group.length !== 0) {
        return (
            <div className="card__block group">
                <div className="card__row">
                    <div className="card__text grey fw-600">Группа</div>
                    <div className="card__group-value">{group}</div>
                </div>
            </div>
        );
    }
}
