import { useEffect, useState } from "react";
import { getToken, data, avgData, esp, user } from "@/lib/context";

export const fetchWithAuth = async (url: string) => {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    throw error;
  }
};

export const useFetchData = (
    precision: string,
    ip: string,
    from: string,
    to: string,
) => {
  const [data, setData] = useState<avgData[]>([]);

  useEffect(() => {
    const url = `/postgrest/rpc/avg_date?delta=${precision}&ip=eq.${ip}::inet&and=(date.gte.${from},date.lt.${to})`;
    fetchWithAuth(url);
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then((response) => response.json())
        .then((apiData: avgData[]) => {
          setData(apiData);
        })
        .catch((e) => {
          console.error("Une erreur s'est produite :", e);
        });
  }, [from, ip, precision, to]);
  return data;
};

export function useLastData(type: string, ip: string) {
  const [value, setValue] = useState<number | undefined>(undefined);

  useEffect(() => {
    const url = `/postgrest/data_view?limit=1&order=timestamp.desc&ip=eq.${ip}`;
    fetchWithAuth(url);
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => response.json())
      .then((apiData: data[]) => {
        if (apiData && apiData.length > 0) {
          if (type == "humidity") {
            setValue(apiData[0].humidity);
          } else setValue(apiData[0].temperature);
        }
      })
      .catch((e) => {
        console.error("Une erreur s'est produite :", e);
      });
  }, [ip, type]);
  return value;
}

export const useAllEsp = () => {
  const [esp, setEsp] = useState<esp[]>([]);

  useEffect(() => {
    const url = `/postgrest/esp`;
    fetchWithAuth(url);
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => response.json())
      .then((apiEsp: esp[]) => {
        setEsp(apiEsp);
      })
      .catch((e) => {
        console.error("Une erreur s'est produite :", e);
      });
  }, []);
  return esp;
};

export default function useFindIpById(id: string) {
  const [ip, setIp] = useState<string>("");

  useEffect(() => {
    const url = `/postgrest/esp?select=ip&id=eq.${id}`;
    fetchWithAuth(url);
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => response.json())
      .then((apiIp: esp[]) => {
        setIp(apiIp[0].ip);
      })
      .catch((e) => {
        console.error("Une erreur s'est produite :", e);
      });
  }, [id]);
  return ip;
}

export function useFindNameById(id: string) {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const url = `/postgrest/esp?select=name&id=eq.${id}`;
    fetchWithAuth(url);
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => response.json())
      .then((apiIp: esp[]) => {
        setName(apiIp[0].name);
      })
      .catch((e) => {
        console.error("Une erreur s'est produite :", e);
      });
  }, [id]);
  return name;
}

export function useAllUsers() {
  const [users, setUsers] = useState<user[]>([]);

  useEffect(() => {
    const url = `/postgrest/users`;
    fetchWithAuth(url);
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => response.json())
      .then((apiUsers: user[]) => {
        setUsers(apiUsers);
      })
      .catch((e) => {
        console.error("Une erreur s'est produite :", e);
      });
  }, []);
  return users;
}

export function GetEspPosition(id: string) {
  const [position, setPosition] = useState<esp[]>([]);

  useEffect(() => {
    const url = `/postgrest/esp?select=x,y,name,ip&id=eq.${id}`;
    fetchWithAuth(url);
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => response.json())
      .then((apiPosition: esp[]) => {
        setPosition(apiPosition);
      })
      .catch((e) => {
        console.error("Une erreur s'est produite :", e);
      });
  }, [id]);
  if (position.length == 0 || position[0].x == null || position[0].y == null) {
    return { x: 0, y: 0, name: "", ip: "" };
  }
  return position[0];
}

// Définir une interface pour les objets dans allData
interface DataRecord {
  avg_temperature: number;
  avg_humidity: number;
  // Ajoutez d'autres propriétés si nécessaire
}

export const useFetchToken = (ip: any) => {
  const [data, setData] = useState<string>("");
  const url = `/php/esp`;
  const response = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ ip: ip }),
  })
    .then((response) => response.json())
    .then((data: { token: string }) => {
      setData(data.token);
    })
    .catch((e) => console.error("error c'est produite : ", e));
  return data;
};

// Fonction pour calculer la moyenne d'une propriété spécifique
export function calculateAverage(
  allData: DataRecord[],
  property: keyof DataRecord,
): number {
  if (!Array.isArray(allData)) {
    console.warn("Warning: allData is not an array");
    return 0;
  } else {
    const total = allData.reduce((sum, record) => sum + record[property], 0);
    return total / allData.length;
  }
}
