/**
 * Resolve a person record from either employees (users) or staff (officials).
 * IDs are disjoint: users 10+, officials 1–21 (plus 19, 20).
 */
export function createPersonResolver(users = [], officials = []) {
  const userMap = new Map(users.map((u) => [Number(u.UserID), { ...u, personType: "user" }]));
  const officialMap = new Map(
    officials.map((o) => [Number(o.OfficialID), { ...o, personType: "official", UserID: o.OfficialID }])
  );

  const getPerson = (id) => {
    if (id == null) return null;
    const num = Number(id);
    return userMap.get(num) || officialMap.get(num) || null;
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
