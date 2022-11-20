import * as dayjs from "dayjs";

/**
 * Рендер вида просмотра задачи
 * @param {*} props ожидаетя объект с данными о задаче, id задачи, статус, список ссылок, относящихся к задаче. Функции закрытитя блока задачи, смена вида окна (просмотр, изменение), изменения статуса задачи и удаления задачи. Действие при отправке формы
 * @returns собраный html
 */
export default function TodoShow(props) {
  const { title, deadline, description } = props.data;
  const { id, taskStatus, links, close, changeViue, changeStatus, remove} = props;

  /**
   * Рендер ссылок на приложенные файлы
   * @returns массив html элементов
   */
  const renderlinks = () => {
    let linksItems = [];
    if (links) {
      links.forEach((link, i) => {
        linksItems.push(
          <a key={i} target="_blank"  rel="noreferrer" href={link}>
            Файл {i}
          </a>
        );
      });
    }
    return linksItems;
  };

  const radio = taskStatus === "process" ?
    <div className="radio" onClick={() => changeStatus( id, "finished")}>
      <input type="radio"  />
      <p>Готово</p>
    </div> :
    <div className="radio" checked onClick={() => changeStatus( id, "process")}>
      <input type="radio" />
      <p>Готово</p>
    </div> 

  return (
    <div className={"TodoPage"}>
      <div className={"content"}>
        <h3>{title}</h3>
        <p>{dayjs(deadline).format("DD.MM.YYYY")}</p>
        <p>{description}</p>
        {renderlinks()}
      </div>
      <div>
        <p onClick={close} className="button">
          Закрыть
        </p>
        {radio}
        <p onClick={changeViue} className="button">
          Изменить
        </p>
      
        <p onClick={() => remove(id)} className="button">
          Удалить
        </p>
      </div>
    </div>
  );
}
