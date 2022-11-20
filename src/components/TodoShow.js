import * as dayjs from "dayjs";

/**
 * Рендер вида просмотра задачи
 * @param {*} props ожидаетя объект с данными о задаче, id задачи, статус, список ссылок, относящихся к задаче. Функции закрытитя блока задачи, смена вида окна (просмотр, изменение), изменения статуса задачи и удаления задачи. Действие при отправке формы
 * @returns собраный html
 */
export default function TodoShow(props) {
  const { title, deadline, description, isInProcess } = props.data;
  const {
    id,
    taskStatus,
    links,
    close,
    changeViue,
    changeStatus,
    remove,
  } = props;

  /**
   * Рендер ссылок на приложенные файлы
   * @returns массив html элементов
   */
  const renderlinks = () => {
    let linksItems = [];
    if (links) {
      links.forEach((link, i) => {
        linksItems.push(
          <a key={i} target="_blank" href={link}>
            Файл {i}
          </a>
        );
      });
    }
    return linksItems;
  };

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
        <p onClick={changeViue} className="button">
          Изменить
        </p>
        <p
          onClick={() =>
            changeStatus(id, {
              deadline,
              description,
              isInProcess: !isInProcess,
              status: taskStatus === "process" ? "finished" : "process",
              title,
            })
          }
          className="button"
        >
          {taskStatus === "process" ? "Выполнено" : "Не выполнено"}
        </p>
        <p onClick={() => remove(id)} className="button">
          Удалить
        </p>
      </div>
    </div>
  );
}
