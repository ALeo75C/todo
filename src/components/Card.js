import * as dayjs from "dayjs";
import {taskStatus} from "../_taskStatus";

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
    onClick,
    changeTaskStatus,
    removeTodo,
    status
  } = props;
  

  if (!status) {
    return (
      <div onClick={onClick} className={'Card empty'}>
        <h3>+ Добавить задачу</h3>
      </div>
    );
  } else {
    let st
    if (status === taskStatus.finished) {
      st =(<div className="radio" onClick={() => changeTaskStatus(id)}>
      <input type="checkbox" checked />
      <p>Готово</p>
    </div>)
    } else {
      st = (<div className="radio" onChange={() => changeTaskStatus( id)}>
      <input type="checkbox"/>
      <p>Готово</p>
      </div>)
    }

    return (
      <div
        onClick={() => onClick(Number(id))}
        className={`Card ${status}`}
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
