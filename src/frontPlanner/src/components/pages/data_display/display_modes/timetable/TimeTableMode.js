export default function TimeTableMode() {
    return (
        <iframe
            title="Mattermost"
            id="timetableIframe"
            className="iframe-timetable-mode"
            src={`http://10.199.254.28:5713/`}
            style={{ width: '100%', height: '100%', border: 'none' }}
        />
    );
}
