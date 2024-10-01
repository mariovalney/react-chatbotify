import { createContext, MutableRefObject, useContext, useEffect, useRef, useState } from "react";

import { applyCssStyles } from "../services/ThemeService";
import { parseConfig } from "../utils/configParser";
import { BotRefsProvider } from "./BotRefsContext";
import { BotStatesProvider } from "./BotStatesContext";
import { MessagesProvider } from "./MessagesContext";
import { PathsProvider } from "./PathsContext";
import { SettingsProvider } from "./SettingsContext";
import { StylesProvider } from "./StylesContext";
import { ToastsProvider } from "./ToastsContext";
import { Flow } from "../types/Flow";
import { Settings } from "../types/Settings";
import { Styles } from "../types/Styles";
import { Theme } from "../types/Theme";

type ChatBotProviderContextType = {
	loadConfig: (id: string, flow: Flow, settings: Settings, styles: Styles,
		themes: Theme | Theme[] | undefined,
		shadowContainerRef: MutableRefObject<HTMLDivElement | null>) => Promise<void>;
};
// Create a context to detect whether ChatBotProvider is present
const ChatBotContext = createContext<ChatBotProviderContextType | undefined>(undefined);
export const useChatBotContext = () => {
	return useContext(ChatBotContext);
};

const ChatBotProvider = ({
	children
}: {
	children: React.ReactNode;
}) => {
	// handles bot id ref
	const botIdRef = useRef<string>("");

	// handles bot flow ref
	const botFlowRef = useRef<Flow>({});

	// handles bot settings
	const [botSettings, setBotSettings] = useState<Settings>({});

	// handles bot styles
	const [botStyles, setBotStyles] = useState<Styles>({});

	// handles DOM loaded event to ensure chatbot is loaded after DOM is ready (necessary for SSR support)
	const [isDomLoaded, setIsDomLoaded] = useState<boolean>(false);

	useEffect(() => {
		setIsDomLoaded(true);
	}, []);

	/**
	 * Loads configurations for the chatbot and applies styles within the shadow DOM.
	 *
	 * @param botId id of the chatbot
	 * @param flow conversation flow for the bot
	 * @param settings settings to setup the bot
	 * @param styles styles to apply to the bot
	 * @param themes themes to apply to the bot
	 * @param shadowContainerRef ref to the shadow container
	 */
	const loadConfig = async (
		botId: string,
		flow: Flow,
		settings: Settings,
		styles: Styles,
		themes: Theme | Theme[] | undefined,
		shadowContainerRef: MutableRefObject<HTMLDivElement | null>,
	) => {
		botIdRef.current = botId;
		botFlowRef.current = flow;
		const combinedConfig = await parseConfig(settings, styles, themes);

		// applies css styles only to the shadow dom
		const shadowRoot = shadowContainerRef.current?.shadowRoot;
		if (shadowRoot) {
			await applyCssStyles(shadowRoot, combinedConfig.cssStylesText);
		}

		// applies combined bot settings and styles
		setBotSettings(combinedConfig.settings);
		setBotStyles(combinedConfig.inlineStyles);
	};

	if (!isDomLoaded) {
		return null;
	}

	return (
		<div style={{ fontFamily: botSettings.general?.fontFamily }}>
			<ChatBotContext.Provider value={{ loadConfig }}>
				<SettingsProvider settings={botSettings} setSettings={setBotSettings}>
					<StylesProvider styles={botStyles} setStyles={setBotStyles}>
						<ToastsProvider>
							<BotRefsProvider botIdRef={botIdRef} flowRef={botFlowRef}>
								<PathsProvider>
									<BotStatesProvider settings={botSettings}>
										<MessagesProvider>{children}</MessagesProvider>
									</BotStatesProvider>
								</PathsProvider>
							</BotRefsProvider>
						</ToastsProvider>
					</StylesProvider>
				</SettingsProvider>
			</ChatBotContext.Provider>
		</div>
	);
};

export default ChatBotProvider;
