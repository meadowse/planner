import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

// Импорт компонетов
import IconButton from '@generic/elements/buttons/IcButton';
import AddDeparturePopup from './popup/AddDeparturePopup';
import ListMode from '../../../display_modes/table/ListMode';

// Импорт вспомогательного функционала
import { findNestedObj } from '@helpers/helper';

// Импорт стилей
import './tab_departures.css';

export default function TabDepartures({ subsection }) {
    const [stateInputPopup, setStateInputPopup] = useState(false);
    const departures =
        subsection && Object.keys(subsection).length !== 0
            ? {
                  keys: findNestedObj(subsection['valuesToDisplay'], 'mode', 'Список')?.keys || {},
                  data: subsection.data || []
              }
            : {};

    // console.log(`departures: ${JSON.stringify(departures, null, 4)}`);
    // console.log(`subsection: ${JSON.stringify(subsection, null, 4)}`);

    return (
        <div className="section__tab-departures section__tab">
            <div className="tab_departures_content">
                <IconButton
                    nameClass={'ic_btn add_departure'}
                    text={'Добавить работу'}
                    icon={'plus_wh.svg'}
                    onClick={() => setStateInputPopup(true)}
                />
                {stateInputPopup
                    ? createPortal(
                          <AddDeparturePopup
                              title={'Выезд'}
                              additClass={'add_departure'}
                              stateInputPopup={stateInputPopup}
                              setStateInputPopup={setStateInputPopup}
                          />,
                          document.getElementById('portal')
                      )
                    : null}
                {departures && Object.keys(departures).length !== 0 ? (
                    <ListMode testData={departures.data} keys={departures.keys} />
                ) : (
                    <p className="info_message">Данные отсутствуют</p>
                )}
            </div>
        </div>
    );
}
