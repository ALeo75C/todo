import { useState } from "react";

import TodoShow from "./TodoShow";
import TodoEdit from "./TodoEdit";

/**
 * Опредение, какое состояние задания отрисовывать (просмотр или редактирование)
 * @param {*} props ожидаетя объект с данными о задаче, id задачи, список ссылок, относящихся к задаче. Функции закрытитя блока задачи, изменения статуса задачи,  и удаления задачи
 * @returns собраный html
 */
export default function TodoPage(props) {
  const [patrType, setPatrType] = useState("show");
  /**
   * Переключение вида блока (просмотр, изменение)
   */
  const changePartType = () => {
    const type = patrType === "show" ? "edit" : "show";
    setPatrType(type);
  };

  if (patrType === "show") {
    return (
      <TodoShow
        data={props.data}
        id={props.id}
        links={props.links}
        taskStatus={props.data.status}
        close={props.close}
        changeViue={changePartType}
        changeStatus={props.changeTaskStatus}
        remove={props.remove}
      />
    );
  } else {
    return (
      <TodoEdit
        data={props.data}
        id={props.id}
        close={props.close}
        changeViue={changePartType}
        handleSubmit={props.changeTask}
      />
    );
  }
}
