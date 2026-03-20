import {IonItem, IonLabel} from "@ionic/react";
import React from "react";

type FaqAccordionProps = {
  questions: Array<any>;
}

const FaqAccordion: React.FC<FaqAccordionProps> = ({questions}) => {
  const findLink = (text: string) => {
    let urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    })
  };

  const renderPanel = (item: any) => {
    let text = findLink(item.answer);

    return (
      <div>
        <IonItem>
          <IonLabel className="accordion-label">
            <div>
              <p dangerouslySetInnerHTML={{__html: `${text}`}}>
              </p>
            </div>
          </IonLabel>
        </IonItem>
      </div>
    );
  }

  const headerClicked = (event: any) => {
    event.currentTarget.classList.toggle("active");
    const allPanels = document.getElementsByClassName("panel");

    Array.from(allPanels).forEach((panel: any) => {
      if (event.currentTarget.nextElementSibling !== panel) {
        panel.style.maxHeight = null;
      }

      panel.previousElementSibling.classList.remove("active");
    });

    let panel = event.currentTarget.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  };

  return (
    <>
      {
        questions.map((item, index) => (
          <div key={index}>
            <button className="accordion" onClick={headerClicked}>
              <span className='panel-header'>{item.question}</span>
            </button>
            <div className="panel">{renderPanel(item)}</div>
          </div>
        ))
      }
    </>
  );
};

export default FaqAccordion;
