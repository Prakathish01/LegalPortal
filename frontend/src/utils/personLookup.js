/**
 * Resolve a person record from either employees (users) or staff (officials).
 */
export function createPersonResolver(users = [], officials = []) {
  const userMap = new Map(users.map((u) => [String(u.UserID), { ...u, personType: "user" }]));
  const officialMap = new Map(
    officials.map((o) => [String(o.OfficialID), { ...o, personType: "official", UserID: o.OfficialID }])
  );

  const getPerson = (id) => {
    if (id == null) return null;
    const strId = String(id);
    return userMap.get(strId) || officialMap.get(strId) || null;
  };

  const getPersonName = (id) => getPerson(id)?.FullName || "Unknown";

  return { getPerson, getPersonName, userMap, officialMap };
}

export function getOfficialId(person) {
  if (!person) return null;
  return person.OfficialID ?? (person.personType === "official" ? person.UserID : null);
}

export function getUserId(person) {
  if (!person) return null;
  return person.personType === "user" ? person.UserID : null;
}
