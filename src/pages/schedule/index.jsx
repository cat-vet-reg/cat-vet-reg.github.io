import React, { useState, useEffect } from "react";

import Header           from "../../components/ui/Header";
import Breadcrumb       from "../../components/ui/Breadcrumb";
import MakeAppointment  from "./components/MakeAppointment";
import Calendar         from "./components/Calendar";
import { $apiCreateNewRecord } from "services/create_new_record";


const Schedule = () => {

  const [date, setDate] = useState(new Date());

  const breadcrumbItems = [
      { label: 'Табло'    , path: '/dashboard-overview' },
      { label: 'График'   , path: '/schedule' }
  ];

  const registerAnimalIntoTheSystem = async (e) => {
    
    for(const element of e.animals) {

      await $apiCreateNewRecord({
        gender      : element.gender,
        data        : {...element, ownerName: e.ownerName, ownerPhone  : e.phone},
        ownerName   : e.ownerName,
        ownerPhone  : e.phone
      });
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                График
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
                График на записаните часове за кастрация в Кастрационния център
            </p>
          </div>


          {/* Секция 1: Формата за записване (отгоре) */}
          <div className="mb-10">
              <MakeAppointment 
                selectedDate={date}
                onAnimalAdd={(e) => registerAnimalIntoTheSystem(e)} />
          </div>

          <hr className="my-10 border-border" />

          {/* Секция 2: Календарът (отдолу) */}
          <div className="mb-10">
              <Calendar selectedDate={date} />
          </div>

        </div>
      </div>

    </>
  );

};

export default Schedule;
