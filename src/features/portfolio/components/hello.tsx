import { USER } from "@/features/portfolio/data/user";
import { MarkdownLinkPreview } from "@/components/markdown-link-preview";
import { HelloTitle } from "@/features/portfolio/components/hello-title";
import { HelloInspiration } from "@/features/portfolio/components/hello-inspiration";
import {
  Panel,
  PanelContent,
  PanelHeader,
} from "@/features/portfolio/components/panel";

const ID = "hello";

export function Hello() {
  return (
    <Panel id={ID} className="screen-line-bottom-line">
      <PanelHeader>
        <HelloTitle />
      </PanelHeader>

      <PanelContent>
        <div className="typeset typeset-description [&_li]:ps-0.5 [&_ul]:ps-3.5">
          <MarkdownLinkPreview>{USER.about}</MarkdownLinkPreview>
          <ul className="mt-0">
            <HelloInspiration />
          </ul>
        </div>
      </PanelContent>

      <div className="screen-line-top h-4" />
    </Panel>
  );
}
