import { Request, Response } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {ObjectId} from "https://deno.land/x/mongo@v0.30.0/mod.ts";

import db from "../database/connectDB.ts";
import { TaskSchema } from "../schema/task.ts";

const tasks = db.collection<TaskSchema>("tasks");

export const postTask = async({request, response}:{request: Request; response: Response}) => {
    const bodyValue = await request.body();
    const { name, isCompleted } = await bodyValue.value;
    const _id = await tasks.insertOne({
        name: name,
        isCompleted: isCompleted
    });
    response.body = {message: `Task created!`, id:_id, name: name, isCompleted: isCompleted}
};

export const getTasks = async ({response}: {response: Response}) => {
    const allTasks = await tasks.find({}).toArray();

    response.status = 200;
    response.body = {tasks: allTasks};
};

export const getTask = async ({
    params,
    response
   }:{
    params:{taskId: string};
    response: Response;
  }) => {
    const taskId = params.taskId;
    const task = await tasks.findOne({_id:new ObjectId(taskId)});

    if(!task){
        response.body = {message: `no task with Id: ${taskId}`};
        return;
    }
    response.status = 200;
    response.body = {task: task}
};

export const updateTask = async ({
    params,
    request,
    response
}:{
    params:{taskId: string};
    request: Request;
    response: Response;
}) => {
    const taskId = params.taskId;
    const {name, isCompleted} = await request.body().value;
    const task = await tasks.updateOne({_id: new ObjectId(taskId)},
    {$set:{name: name, isCompleted: isCompleted}});

    response.status = 200;
    response.body = {message: "Updated task", task: task};
};

export const deleteTask = async ({
    params,
    response,
}:{
    params: {taskId: string};
    response: Response;
}) => {
    const taskId = params.taskId;
    console.log('DELETE, taskId: ', taskId)
    const task = await tasks.deleteOne({_id:new ObjectId(taskId)});
    response.status = 200;
    response.body = {message:"Deleted task", task:task};
};
