export default function TimeTableMode() {
    return (
        <div className="timetable-mode">
            <iframe
                title="Mattermost"
                src={`http://10.199.254.28:5713/`}
                style={{ width: '100%', height: '100%', border: 'none' }}
            />
        </div>
    );
}
