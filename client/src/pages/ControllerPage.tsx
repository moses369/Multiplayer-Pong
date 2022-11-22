import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
import { useNavigate } from "react-router-dom";
import Controller from '../components/ControllerPage/Controller/Controller'

const ControllerPage = () => {
  const navigate = useNavigate()
  const { inSession } = useSelector(
    ({menu:{inSession} }: RootState) => ({ inSession })
  );
  useEffect(() => {
    !inSession && navigate('/')
  }, [inSession]);
  return (
    <><Controller/></>
  )
}

export default ControllerPage