export default function TimeTableMode() {
    return (
        <iframe
            title="Mattermost"
            id="timetableIframe"
            className="iframe-timetable-mode"
            src={`${window.location.origin}/vacations`}
            style={{ width: '100%', height: '100%', border: 'none' }}
        />
    );
}
