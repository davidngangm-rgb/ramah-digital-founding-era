"use client";
import {useActionState} from "react";
import {joinFreeCreatorCircle,type WaitlistState} from "@/app/circles/actions";
import {ActionSubmitButton} from "@/components/ActionSubmitButton";

const initialState:WaitlistState={status:"idle",message:""};

export function FreeCircleJoinForm({circleId,approvalRequired}:{circleId:string;approvalRequired:boolean}){
  const [state,action,pending]=useActionState(joinFreeCreatorCircle,initialState);
  if(state.status==="success")return <div className="rd-form-success" role="status"><b>{state.message}</b></div>;
  return <form action={action} className="rd-free-circle-join"><input type="hidden" name="circleId" value={circleId}/><ActionSubmitButton className="rd-button" isLoading={pending} loadingText="Joining…">{approvalRequired?"Request to join":"Join this Circle - free"}</ActionSubmitButton>{state.status==="error"&&<p className="rd-form-error" role="alert">{state.message}</p>}</form>;
}
