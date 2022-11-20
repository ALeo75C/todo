import * as dayjs from "dayjs";

/**
 * Рендер карточек заданий и пустой карточки для создания новой
 * @param {*} props данные для отоброжения карточки 
 * @returns собраный html  
 */
export default function Card(props) {
  const {
    id,
    title,
    deadline,
    status,
    onClick,
    changeTaskStatus,
    removeTodo,
  } = props;

  if (status === "empty") {
    return (
      <div onClick={onClick} className={`Card ${status}`}>
        <h3>+ Добавить задачу</h3>
      </div>
    );
  } else {
    let st =
      status === "overdue" ? (
        <h4>просрочено</h4>
      ) : status === "process" ? (
        <div className="radio" onChange={() => changeTaskStatus( id, "finished")}>
          <input type="radio" />
          <p>Готово</p>
        </div>
      ) : (
        <div className="radio" onClick={() => changeTaskStatus( id, "process")}>
          <input type="radio" checked />
          <p>Готово</p>
        </div>
      );

    return (
      <div
        onClick={() => onClick(Number(id))}
        className={`Card ${status === "process"}`}
      >
        <div className={"content"}>
          <h3>{title}</h3>
          <p>{dayjs(deadline).format("DD.MM.YYYY")}</p>
        </div>
        <div>
          {st}
          <p onClick={() => removeTodo(id)}>Удалить</p>
        </div>
      </div>
    );
  }
}
