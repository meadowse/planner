import { useState } from 'react';
import classNames from 'classnames';

// Импорт компонентов
import CardStructure from './cards/StructureCard';

// Импорт стилей
import './company_structure.css';

// Функция для формирования струкутры компании в виде дерева
function ToFormTreeCompany({ args }) {
    // console.log(`data Company: ${JSON.stringify(data, null, 4)}`);
    const [isVisible, setIsVisible] = useState(false);
    const { level, indentPx, data } = args;

    let index = level;
    let colGapInPx = indentPx;

    const section = {
        section: data?.section,
        higherleveldivision: data?.higherleveldivision,
        photo: data?.photo,
        director: data?.director,
        subordinates: data?.subordinates
    };
    const subsections = data?.subsectionsData;

    function onExpand() {
        setIsVisible(!isVisible);
    }

    return (
        <>
            <CardStructure
                key={index}
                data={{ ...section, subsectionsData: subsections }}
                isVisible={isVisible}
                onExpandBranch={onExpand}
            />
            {isVisible && Array.isArray(subsections) && subsections.length !== 0 ? (
                <ul
                    className={classNames({ 'page__company-level': subsections.length > 1 })}
                    style={{
                        gridTemplateColumns: `repeat(${subsections.length}, max-content)`,
                        columnGap: `${colGapInPx / 16}rem`
                    }}
                >
                    {subsections.map(item => {
                        index++;
                        const argsTree = { level: index, indentPx: 85, data: item };
                        return (
                            <li className="page__company-level-item">
                                <ToFormTreeCompany args={argsTree} />
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </>
    );
}

export default function CompanyStructure({ testData }) {
    // const [showSubsections, setShowSubsections] = useState(false);
    const argsTree = { level: 0, indentPx: 150, data: testData };
    // console.log(`CompanyStructure data: ${JSON.stringify(testData, null, 4)}`);

    return (
        <div className="page__company-struct">
            {testData && Object.keys(testData).length !== 0 ? (
                <div className="page__company-struct-wrapper">
                    <ToFormTreeCompany args={argsTree} />
                </div>
            ) : (
                <p className="info-message">Нет данных</p>
            )}
        </div>
    );
}
