"use client";
import {useActionState} from "react";
import {joinFreeCreatorCircle,type WaitlistState} from "@/app/circles/actions";

const initialState:WaitlistState={status:"idle",message:""};

export function FreeCircleJoinForm({circleId,approvalRequired}:{circleId:string;approvalRequired:boolean}){
  const [state,action,pending]=useActionState(joinFreeCreatorCircle,initialState);
  if(state.status==="success")return <div className="rd-form-success" role="status"><b>{state.message}</b></div>;
  return <form action={action} className="rd-free-circle-join"><input type="hidden" name="circleId" value={circleId}/><button className="rd-button" disabled={pending}>{pending?"Joining…":approvalRequired?"Request to join":"Join this Circle — free"}</button>{state.status==="error"&&<p className="rd-form-error" role="alert">{state.message}</p>}</form>;
}
