import { useState } from 'react';
import UserInfo from '../UserInfo';

export default function StructUser({ status }) {
    const [id, setId] = useState();

    if (status) {
        const renderUser = () => {
            console.log(<UserInfo id={id} />);
        };

        return (
            <div className="subordination__block">
                {status.map(({ personal_photo, full_name, id }) => {
                    return (
                        <div className="subordination__box" onClick={renderUser} key={id} id={id}>
                            <span className="subordination__img">
                                <img src={`${personal_photo}`} alt="" />
                            </span>
                            <span className="card__text">{full_name}</span>
                        </div>
                    );
                })}
            </div>
        );
    }
}
