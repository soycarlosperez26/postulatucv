import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { CvDocumentData } from "@/components/cv/CvDocument";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#1a1612",
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
    color: "#1a1612",
  },
  contactLine: {
    fontSize: 9,
    color: "#6b6560",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e1db",
    marginVertical: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#918b83",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#3d3932",
  },
  jobItem: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  jobRole: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a1612",
  },
  jobDate: {
    fontSize: 9,
    color: "#6b6560",
  },
  jobCompany: {
    fontSize: 9.5,
    fontWeight: 600,
    color: "#6b6560",
    marginBottom: 4,
  },
  achievement: {
    flexDirection: "row",
    marginBottom: 3,
  },
  achievementBullet: {
    width: 15,
    fontSize: 10,
    color: "#e5e1db",
  },
  achievementText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.55,
    color: "#3d3932",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e1db",
    backgroundColor: "#fdfcfa",
  },
  skillText: {
    fontSize: 9,
    fontWeight: 600,
    color: "#3d3932",
  },
  educationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  educationText: {
    fontSize: 10,
    fontWeight: 600,
    color: "#1a1612",
    flex: 1,
  },
  educationDate: {
    fontSize: 9,
    color: "#6b6560",
  },
  languagesText: {
    fontSize: 10,
    color: "#3d3932",
  },
});

function dateRange(start?: string, end?: string, current?: boolean) {
  const from = start?.trim();
  const to = current ? "Actualidad" : end?.trim();
  if (from && to) return `${from} — ${to}`;
  return from || to || "";
}

export function CvPdfDocument({ data }: { data: CvDocumentData }) {
  const languages = "languages" in data ? (data.languages ?? []) : [];
  const certifications = "certifications" in data ? (data.certifications ?? []) : [];
  const links = data.contact.links ?? [];

  const contactLine = [data.contact.location, data.contact.phone, data.contact.email]
    .filter(Boolean)
    .concat(links)
    .join(" · ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.contact.name || "Sin nombre"}</Text>
          {contactLine && <Text style={styles.contactLine}>{contactLine}</Text>}
        </View>

        <View style={styles.divider} />

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfil profesional</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia profesional</Text>
            {data.experience.map((job, i) => (
              <View key={i} style={styles.jobItem}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobRole}>{job.role}</Text>
                  <Text style={styles.jobDate}>
                    {dateRange(job.startDate, job.endDate, job.current)}
                  </Text>
                </View>
                <Text style={styles.jobCompany}>{job.company}</Text>
                {job.achievements.length > 0 && (
                  <View>
                    {job.achievements.map((achievement, j) => (
                      <View key={j} style={styles.achievement}>
                        <Text style={styles.achievementBullet}>—</Text>
                        <Text style={styles.achievementText}>{achievement}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.skillsContainer}>
              {data.skills.map((skill, i) => (
                <View key={i} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación</Text>
            {data.education.map((ed, i) => (
              <View key={i} style={styles.educationItem}>
                <Text style={styles.educationText}>
                  {[ed.degree, ed.field].filter(Boolean).join(" en ")}
                  {ed.degree || ed.field ? " — " : ""}
                  {ed.institution}
                </Text>
                <Text style={styles.educationDate}>
                  {dateRange(ed.startDate, ed.endDate)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <Text style={styles.languagesText}>{languages.join(" · ")}</Text>
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificaciones</Text>
            <Text style={styles.languagesText}>{certifications.join(" · ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
