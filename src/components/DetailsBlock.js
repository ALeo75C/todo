import { useState } from "react";

import DetailsDisplay from "./DetailsDisplay";
import DetailsEditor from "./DetailsEditor";

/**
 * Опредение, какое состояние задания отрисовывать (просмотр или редактирование)
 * @param {*} props ожидаетя объект с данными о задаче, id задачи, список ссылок, относящихся к задаче. Функции закрытитя блока задачи, изменения статуса задачи,  и удаления задачи
 * @returns собраный html
 */
export default function DetailsBlock(props) {
  const [isEditMode, setMode] = useState(false);

    if (!isEditMode) {
      return (
        <DetailsDisplay
          data={props.data}
          id={props.id}
          links={props.links}
          close={props.close}
          changeView={()=>setMode(!isEditMode)}
          changeStatus={props.changeTaskStatus}
          remove={props.remove}
        />
      );
    } else {
      return (
        <DetailsEditor
          data={props.data}
          id={props.id}
          close={props.close}
          changeView={()=>setMode(!isEditMode)}
          handleSubmit={props.changeTask}
        />
      );
    }
}
