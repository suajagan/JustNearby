import type { PostCategory } from "../api/postApi";
import "../styles/categoryPicker.css";

type Props = {
    onPick: (cat: PostCategory) => void;
};

type Item = {
    cat: PostCategory;
    title: string;
    subtitle: string;
    icon: string;
};

const items: Item[] = [
    { cat: "ANNOUNCEMENT", title: "Notice", subtitle: "Offer help or share news", icon: "📣" },
    { cat: "SEARCH", title: "Search", subtitle: "Ask for help, tips, or things", icon: "🔎" },
    { cat: "RECOMMENDATION", title: "Recommendation", subtitle: "Share your tips", icon: "👍" },
    { cat: "EVENT", title: "Event", subtitle: "Plan meetings or share actions", icon: "📅" },
    { cat: "OFFER", title: "Marketplace", subtitle: "Give away or sell items", icon: "🛒" },
];

export default function CategoryPickerModal({ onPick }: Props) {
    return (
        <div className="cp-wrap">
            <div className="cp-header">
                <h2 className="cp-title">Choose a category:</h2>
            </div>

            <div className="cp-list">
                {items.map((it) => (
                    <button
                        key={it.cat}
                        type="button"
                        className="cp-item"
                        onClick={() => onPick(it.cat)}
                    >
                        <div className="cp-icon">{it.icon}</div>
                        <div className="cp-text">
                            <div className="cp-itemTitle">{it.title}</div>
                            <div className="cp-itemSub">{it.subtitle}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
