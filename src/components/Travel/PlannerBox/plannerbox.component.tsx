import React, { Fragment, useEffect, useState } from "react";
import styles from "./plannerbox.module.scss";
import ThemeButton from "../../GlobalComponents/ThemeButton/themebutton.component";
import { useDispatch } from "react-redux";
import {
  addItinerary,
  updateItineraryNamesByDate,
} from "../../../store/Data/slice";
import { v4 as uuidv4 } from "uuid";
import { itinerary, meal } from "../../../models/itinerary";

import { Calendar } from "react-calendar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { Icon, Tooltip } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { AppState } from "../../../store/store";
import { resetSelectedResturaunt } from "../../../store/Edit/slice";

const PlannerBox = (): JSX.Element => {
  const dispatch = useDispatch();

  const $selectedRestaurant = useSelector(
    (state: AppState) => state.edit.selectedResturaunt,
  );
  const [mealAddable, setMealAddable] = useState<boolean>(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDate, setEditingDate] = useState(false);

  const [itineraryName, setItineraryName] = useState("");
  const [currentMeal, setCurrentMeal] = useState<meal>({
    id: "",
    time: "",
    type: "Breakfast",
    location: "",
  });
  const [addingTime, setAddingTime] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [newItinerary, setNewItinerary] = useState<itinerary>({
    id: uuidv4(),
    month: selectedDate.getMonth() + 1,
    day: selectedDate.getDate(),
    year: selectedDate.getFullYear(),
    meals: [],
    title: "",
  });

  const handleChangeItineraryName = (
    month: number,
    day: number,
    year: number,
    newName: string,
  ): void => {
    dispatch(updateItineraryNamesByDate({ month, day, year, newName }));
  };

  const handleMealSubmit = (): void => {
    setNewItinerary({
      ...newItinerary,
      meals: [...newItinerary.meals, currentMeal],
    });
    dispatch(resetSelectedResturaunt());
    setAddingTime(!addingTime);
  };

  const handleFinishItinerary = (): void => {
    setEditingName(false);
    setEditingDate(false);
    setAddingTime(false);
    setItineraryName("");

    dispatch(
      addItinerary({
        ...newItinerary,
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate(),
        year: selectedDate.getFullYear(),
      }),
    );

    setNewItinerary({
      id: uuidv4(),
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate(),
      year: selectedDate.getFullYear(),
      meals: [],
      title: "",
    });

    dispatch(resetSelectedResturaunt());
  };

  useEffect(() => {
    $selectedRestaurant &&
      setCurrentMeal({ ...currentMeal, location: $selectedRestaurant });
  }, [$selectedRestaurant]);

  const handleDateChange = (date: Date): void => {
    setSelectedDate(date);
    setEditingDate(false);
  };

  useEffect(() => {
    if (
      !$selectedRestaurant ||
      currentMeal.time === "" ||
      currentMeal.type === ""
    )
      setMealAddable(false);
    else setMealAddable(true);
  }, [$selectedRestaurant, currentMeal]);

  return (
    <Fragment>
      <div className={styles.Planner}>
        <div style={{ width: "50%" }}>
          {editingName && (
            <form style={{ display: "flex", alignItems: "center" }}>
              <input
                value={itineraryName}
                style={{
                  marginLeft: "1%",
                  marginRight: "3%",
                }}
                onChange={(e): void => {
                  setItineraryName(e.target.value);
                }}
              />
              <CheckIcon
                className={styles.icon}
                onClick={(): void => {
                  setEditingName(false);
                  setNewItinerary({
                    ...newItinerary,
                    title: itineraryName,
                  });
                  handleChangeItineraryName(
                    selectedDate.getMonth() + 1,
                    selectedDate.getDate(),
                    selectedDate.getFullYear(),
                    itineraryName,
                  );
                }}
              />
            </form>
          )}
          {editingDate && (
            <Calendar
              value={selectedDate}
              onChange={(e): void => handleDateChange(e as Date)}
            />
          )}
        </div>
        <div
          style={{
            marginBottom: "1%",
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tooltip
            title="Change the name of your daily itinerary."
            placement="left"
            className={styles.tooltip}
          >
            <EditIcon
              className={styles.icon}
              style={{ marginLeft: "1%", cursor: "pointer" }}
              onClick={(): void => {
                setEditingDate(false);
                setEditingName(!editingName);
              }}
            />
          </Tooltip>

          {newItinerary && (
            <span className={styles.dateAndTitle}>
              {newItinerary.title ? newItinerary.title : "Itinerary"} on{" "}
              {selectedDate.getMonth() +
                1 +
                "/" +
                selectedDate.getDate() +
                "/" +
                selectedDate.getFullYear()}
            </span>
          )}

          <Tooltip
            title="Choose your itinerary date!"
            placement="right"
            className={styles.tooltip}
          >
            <AccessTimeIcon
              className={styles.icon}
              style={{ marginRight: "1%", cursor: "pointer" }}
              onClick={(): void => {
                setEditingName(false);
                setEditingDate(!editingDate);
              }}
            />
          </Tooltip>
        </div>
        <div>
          <ThemeButton
            text={addingTime ? "Cancel Add" : "+ Add New Meal"}
            onClick={(): void => {
              setAddingTime(!addingTime);
              setCurrentMeal({ ...currentMeal, id: uuidv4() });
            }}
            buttonType={"normal"}
          />
        </div>
        <div style={{ marginTop: "1%", marginBottom: "1%" }}>
          Currently Selected Restaurant:{" "}
          {$selectedRestaurant ? (
            <i style={{ color: "green" }}>{$selectedRestaurant}</i>
          ) : (
            <label style={{ color: "red" }}>N/A</label>
          )}
        </div>
        {addingTime && (
          <form
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "1%",
              height: 50,
              gap: "3px",
            }}
            onSubmit={(event): void => {
              event.preventDefault();
              handleMealSubmit();
            }}
          >
            <input
              className={styles.PlannerInput}
              type="time"
              onChange={(e): void => {
                setCurrentMeal({
                  ...currentMeal,
                  time: e.target.value,
                });
              }}
            />
            <select
              className={styles.PlannerInput}
              placeholder="Choose a meal"
              onChange={(e): void => {
                setCurrentMeal({ ...currentMeal, type: e.target.value });
              }}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Brunch">Brunch</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
            <button
              className={mealAddable ? styles.plus : styles.plusDisabled}
              type="submit"
              disabled={
                currentMeal.time === "" ||
                currentMeal.type === "" ||
                $selectedRestaurant === undefined
              }
            >
              +
            </button>
          </form>
        )}
        <div className={styles.currentItineraryList}>
          {newItinerary.meals
            .sort((a, b) => {
              const dateA = new Date(`1970-01-01 ${a.time}`);
              const dateB = new Date(`1970-01-01 ${b.time}`);
              return dateA.getTime() - dateB.getTime();
            })
            .map((entry, index) => (
              <div key={index} className={styles.mealEntry}>
                {convertTimeToModern(entry.time)} {entry.type} at{" "}
                {entry.location}
                <Icon>
                  <Delete
                    className={styles.icon}
                    onClick={(): void =>
                      setNewItinerary({
                        ...newItinerary,
                        meals: newItinerary.meals.filter(
                          (meal) => meal.id !== entry.id,
                        ),
                      })
                    }
                  />
                </Icon>
              </div>
            ))}
        </div>
        {newItinerary.meals.length > 0 && newItinerary.day && (
          <ThemeButton
            text={"Save Itinerary"}
            onClick={(): void => handleFinishItinerary()}
            buttonType={"normal"}
          />
        )}
      </div>
    </Fragment>
  );
};

export default PlannerBox;

export const convertTimeToModern = (time: string): string => {
  const parts = time.split(":");

  let hours = parseInt(parts[0], 10);
  const minutes: string = parts[1];

  let ampm = "AM";
  if (hours >= 12) {
    ampm = "PM";
    if (hours > 12) {
      hours -= 12;
    }
  } else if (hours === 0) {
    hours = 12;
  }

  const convertedTimeString = `${hours}:${minutes} ${ampm}`;

  return convertedTimeString;
};
