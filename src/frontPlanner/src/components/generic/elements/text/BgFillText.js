import React from 'react';

export default function BgFillText(props) {
    const { className, type, text, bgColor } = props;
    return React.createElement(
        type,
        {
            className: className,
            style: { padding: 'calc(3px + 0.3vw)', borderRadius: '5px', backgroundColor: bgColor }
        },
        text
    );
}
