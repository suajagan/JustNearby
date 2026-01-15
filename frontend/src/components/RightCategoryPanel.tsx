import { useNavigate } from "react-router-dom";
import type { PostCategory } from "../api/postApi";

type Item = {
    cat: PostCategory;
    label: string;
    icon: string;
};

const items: Item[] = [
    { cat: "ANNOUNCEMENT", label: "Notice", icon: "📣" },
    { cat: "SEARCH", label: "Search", icon: "🔎" },
    { cat: "RECOMMENDATION", label: "Recommendation", icon: "👍" },
    { cat: "EVENT", label: "Events", icon: "📅" },
    { cat: "OFFER", label: "Marketplace", icon: "🛒" },
];

export default function RightCategoryPanel() {
    const navigate = useNavigate();

    return (
        <aside className="rightPanel">
            <div className="rightPanelCard">
                <div className="rightPanelList">
                    {items.map((it) => (
                        <button
                            key={it.cat}
                            type="button"
                            className="rightPanelItem"
                            onClick={() => navigate(`/home?category=${it.cat}`)}
                        >
              <span className="rightPanelIcon" aria-hidden="true">
                {it.icon}
              </span>
                            <span className="rightPanelLabel">{it.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
