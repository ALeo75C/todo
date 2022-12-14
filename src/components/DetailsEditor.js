import { useState } from "react";

/**
 * Рендер вида изменения и создания задачи
 * @param {*} props ожидаетя объект с данными о задаче, id задачи. Функции закрытитя блока, смена вида окна (просмотр, изменение). Действие при отправке формы
 * @returns собраный html
 */
export default function DetailsEditor(props) {
  const { id, close, changeView, handleSubmit, data } = props;

  const [title, setTitle] = useState(data.title);
  const [deadline, setDeadline] = useState(data.deadline);
  const [taskDescription, setTaskDescription] = useState(data.description);
  const [selectFiles, setSelectFiles] = useState(null);

  /**
   * отправка фоормы
   * @param {*} e 
   */
  const sub = (e) => {
    e.preventDefault();
    handleSubmit(
      {
        title,
        deadline: deadline,
        description: taskDescription
      },
      id,
      selectFiles
    );
  };

  return (
    <div className={"DetailsBlock"}>
      <form onSubmit={(e) => sub(e)}>
        <label>
          <span>Задача:</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <br />
        <label>
          <span>Дедлайн:</span>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
        <br />
        <label>
          <span>Описание:</span>
          <input
            type="text"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </label>
        <br />
        <input
          type="file"
          multiple
          onChange={(e) => setSelectFiles(e.target.files)}
        />
        <br />
        <input type="submit" value="Сохранить" />
      </form>
      <div>
        <p onClick={close} className="button">
          Закрыть
        </p>
        {changeView ? (
          <p onClick={changeView} className="button">
            Отмена
          </p>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}